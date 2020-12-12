
drop trigger if exists add_instructor_schedule;
drop trigger if exists update_instructor_schedule;
drop trigger if exists add_interim_mod;
drop trigger if exists update_interim_mod;
drop trigger if exists add_online_mod;
drop trigger if exists update_online_mod;
drop trigger if exists add_NIL_null_check;
drop trigger if exists update_NIL_null_check;
drop trigger if exists add_teaches_faulty_mod;
drop trigger if exists update_teaches_faulty_mod;

drop table if exists teaches;
drop table if exists course_offering;
drop table if exists cluster;
drop table if exists course;
drop table if exists instructor;
drop table if exists mod_table;

SET storage_engine=InnoDB;


/* TABLES */

create table instructor (
	instructor_id			decimal(8,0) check (instructor_id >= 0), 
	first_name				varchar(50) not null, 
 	last_name				varchar(50) not null, 
 	email 					varchar(60) not null,
	dept_name				varchar(20) not null, 
	desired_load_min		decimal(3,1) not null check (desired_load_min >= 0),
	desired_load_max		decimal(3,1) not null check (desired_load_max >= desired_load_min),

	primary key (instructor_id)
);


create table course (
	course_id			varchar(6) not null, 
	title				varchar(50) not null, 
	dept_name			varchar(20),
	num_credits			decimal(2,1) not null check (num_credits >= 0),

	primary key (course_id)
);

create index course_credits on course(course_id, num_credits);

create table cluster (
	cluster_id			integer not null check (cluster_id >= 0),
	course_id			varchar(6) not null,

	primary key (cluster_id, course_id),
	foreign key (course_id) references course(course_id) on update cascade
);


create table course_offering (
	course_id 				varchar(6) not null, 
	course_type 			varchar(50) not null, 
 	semester 				enum('Fall','Interim','Spring', 'Summer'), 
 	year 					decimal(4,0) not null check (year >= 1776), 
	section_num 			integer not null check (section_num >= 0), 
	num_credits 			decimal(2,1) not null, 
	TEU_value 				decimal(3,1) check (TEU_value >=0),
 
	primary key (course_id, course_type, semester, year, section_num), 
	foreign key (course_id, num_credits) references course(course_id, num_credits) on update cascade
);


create table mod_table (
	mod_name			varchar(3) not null,
	start_time			time(0),
	end_time			time(0),
	mod_credits			decimal(1, 0) check (mod_credits >= 3 and mod_credits <= 4),
	days_of_week		varchar(5),

	primary key (mod_name, mod_credits)
);


create table teaches (
	instructor_id 		decimal(8,0) check (instructor_id >= 0), 
	course_id 			varchar(6) not null, 
	course_type 		varchar(50) not null, 
	semester 			enum('fall','interim','spring', 'summer'), 
	year 				decimal (4,0) check (year >= 1776), 
	section_num 		integer not null, 
	mod_name 			varchar(3), 
	mod_credits 		decimal(1, 0) check (mod_credits >= 3 and mod_credits <= 4), 

	primary key(instructor_id, course_id, course_type, semester, year, section_num), 
	foreign key fk1 (course_id, course_type, semester, year, section_num) 
		references course_offering (course_id, course_type, semester, year, section_num) on update cascade on delete cascade, 
	foreign key fk2 (instructor_id) references instructor (instructor_id) on update cascade on delete cascade, 
	foreign key fk3  (mod_name, mod_credits) references mod_table (mod_name, mod_credits) on update cascade on delete restrict
);


/* TRIGGERS */


create trigger add_interim_mod after insert on teaches
for each row BEGIN
	if (NEW.mod_name = 'AA' and NEW.semester != 'Interim')
	then
        signal sqlstate value '45000' set message_text = 'AA mod must be in interim!';
	elseif (NEW.mod_name = 'BB' and NEW.semester != 'Interim')
	then
        signal sqlstate value '45000' set message_text = 'BB mod must be in interim!';
	elseif (NEW.semester = 'Interim' and (NEW.mod_name != 'AA' and NEW.mod_name != 'BB' and NEW.mod_name != 'OL'))
	then
    	signal sqlstate value '45000' set message_text = 'Interim course must have mod AA, BB, or OL!';
	end if;
end ;


create trigger update_interim_mod after update on teaches
for each row BEGIN
	if (NEW.mod_name = 'AA' and NEW.semester != 'Interim')
	then
        signal sqlstate value '45000' set message_text = 'AA mod must be in interim!';
	elseif (NEW.mod_name = 'BB' and NEW.semester != 'Interim')
	then
        signal sqlstate value '45000' set message_text = 'BB mod must be in interim!';
	elseif (NEW.semester = 'Interim' and (NEW.mod_name != 'AA' and NEW.mod_name != 'BB' and NEW.mod_name != 'OL'))
	then
    	signal sqlstate value '45000' set message_text = 'Interim course must have mod AA, BB, or OL!';
	end if;
end ;


create trigger add_online_OL after insert on teaches
for each row BEGIN
	if (NEW.mod_name = 'OL' and NEW.course_type != 'Online')
	then
		signal sqlstate value '45000' set message_text = 'OL mod is only for Online type classes!';
	end if;
end ;


create trigger update_online_OL after update on teaches
for each row BEGIN
	if (NEW.mod_name = 'OL' and NEW.course_type != 'Online')
	then
		signal sqlstate value '45000' set message_text = 'OL mod is only for Online type classes!';
	end if;
end ;


create trigger add_NIL_null_check after insert on teaches
for each row BEGIN
	if (NEW.mod_name is not null and NEW.course_id = 'NIL000') /* Special mod for N.I.L.s */
	then
		signal sqlstate value '45000' set message_text = "Non-Instructional Loads can't have a mod!";
	end if;
end ;


create trigger update_NIL_null_check after update on teaches
for each row BEGIN
	if (NEW.mod_name is not null and NEW.course_id = 'NIL000') /* Special mod for N.I.L.s */
	then
		signal sqlstate value '45000' set message_text = "Non-Instructional Loads can't have a mod!";
	end if;
end ;


create trigger add_instructor_schedule before insert on teaches
for each row BEGIN
	declare msg varchar(128);
	if ( (NEW.instructor_id, NEW.course_type, NEW.semester, NEW.year, NEW.mod_name) in (select instructor_id, course_type, semester, year, mod_name from teaches where mod_name != 'OL') )
	then 
		set msg = concat('Instructor has been double Scheduled! Instructor ID: ', cast(new.instructor_id as char));
        	signal sqlstate '45000' set message_text = msg;
	end if;
end ;


create trigger update_instructor_schedule before update on teaches
for each row BEGIN
	declare msg varchar(128);
	if ( (NEW.instructor_id, NEW.course_type, NEW.semester, NEW.year, NEW.mod_name) in (select instructor_id, course_type, semester, year, mod_name from teaches where mod_name != 'OL') )
	then 
		set msg = concat('Instructor has been double Scheduled! Instructor ID: ', cast(new.instructor_id as char));
        	signal sqlstate '45000' set message_text = msg;
	end if;
end ;

											       
create trigger add_teaches_faulty_mod after insert on teaches
for each row BEGIN
    if(((select num_credits from course where course_id = NEW.course_id) != NEW.mod_credits) and (NEW.mod_name is not null) and (NEW.mod_name != 'OL'))
    then
        signal sqlstate value '45000' set message_text = "Cannot Assign a 4 credit course to a 3 credit mod!";
    end if;
end;

																 
create trigger update_teaches_faulty_mod after update on teaches
for each row BEGIN
    if(((select num_credits from course where course_id = NEW.course_id) != NEW.mod_credits) and (NEW.mod_name is not null) and (NEW.mod_name != 'OL'))
    then
        signal sqlstate value '45000' set message_text = "Cannot Assign a 4 credit course to a 3 credit mod!";
    end if;
end;
																 
																 
/* MOD INSERTS */

insert into mod_table values('A', '8:00:00', '8:50:00', 3 , 'MWF');
insert into mod_table values('A', '7:40:00', '8:50:00', 4 , 'MWF');
insert into mod_table values('B', '9:00:00', '9:50:00', 3 , 'MWF');
insert into mod_table values('B', '9:00:00', '10:10:00', 4 , 'MWF');
insert into mod_table values('C', '11:10:00', '12:00:00', 3 , 'MWF');
insert into mod_table values('C', '11:10:00', '12:20:00', 4 , 'MWF');
insert into mod_table values('D', '12:30:00', '13:20:00', 3 , 'MWF');
insert into mod_table values('D', '12:30:00', '13:40:00', 4 , 'MWF');
insert into mod_table values('E', '13:50:00', '14:40:00', 3 , 'MWF');
insert into mod_table values('F', '14:50:00', '15:40:00', 3 , 'MWF');
insert into mod_table values('F', '14:50:00', '16:00:00', 4 , 'MWF');
insert into mod_table values('K', '16:10:00', '17:25:00', 3 , 'MW');
insert into mod_table values('K', '16:10:00', '17:50:00', 4 , 'MW');
insert into mod_table values('M', '18:00:00', '21:00:00', 3 , 'M');
insert into mod_table values('M', '18:00:00', '22:00:00', 4 , 'M');
insert into mod_table values('G', '8:00:00', '9:15:00', 3 , 'TR');
insert into mod_table values('H', '9:25:00', '10:40:00', 3 , 'TR');
insert into mod_table values('H', '9:25:00', '11:05:00', 4 , 'TR');
insert into mod_table values('I', '12:15:00', '13:30:00', 3 , 'TR');
insert into mod_table values('I', '12:15:00', '13:55:00', 4 , 'TR');
insert into mod_table values('J', '14:05:00', '15:20:00', 3 , 'TR');
insert into mod_table values('J', '14:05:00', '15:45:00', 4 , 'TR');
insert into mod_table values('T', '18:00:00', '21:00:00', 3 , 'T');
insert into mod_table values('T', '18:00:00', '22:00:00', 4 , 'T');
insert into mod_table values('W', '18:00:00', '21:00:00', 3 , 'W');
insert into mod_table values('W', '18:00:00', '22:00:00', 4 , 'W');
insert into mod_table values('R', '18:00:00', '21:00:00', 3 , 'R');
insert into mod_table values('R', '18:00:00', '22:00:00', 4 , 'R');
insert into mod_table values('AA', '8:00:00', '10:45:00', 3, 'MTWRF');
insert into mod_table values('BB', '13:00:00', '15:45:00', 3, 'MTWRF');
insert into mod_table values ('OL', null, null, 3, null);
insert into mod_table values ('OL', null, null, 4, null);

/* SPECIAL ROWS */

insert into course values('NIL000', 'Non-Instructional Load', 'General', 0); 
