CREATE TABLE Countries (name VARCHAR(80) NOT NULL ,iso3 VARCHAR(3) NOT NULL ,iso2 VARCHAR(2) NOT NULL ,capital VARCHAR(80)  ,currency VARCHAR(80)  ,region VARCHAR(80)  ,subregion VARCHAR(80)  ,latitude VARCHAR(16)  ,longitude VARCHAR(16)  ,CONSTRAINT Countries_PK PRIMARY KEY (iso3));
ALTER TABLE Countries ADD CONSTRAINT Countries_UK UNIQUE (name);
CREATE TABLE States (id INTEGER NOT NULL ,name VARCHAR(80) NOT NULL ,countryCode VARCHAR(3) NOT NULL ,latitude VARCHAR(16)  ,longitude VARCHAR(16)  ,CONSTRAINT States_PK PRIMARY KEY (id));
ALTER TABLE States ADD CONSTRAINT States_UK UNIQUE (countryCode,name);
ALTER TABLE States ADD CONSTRAINT States_country_FK FOREIGN KEY (countryCode) REFERENCES Countries (iso3);