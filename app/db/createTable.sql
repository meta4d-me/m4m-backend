create table if not exists `initialization`
(
    chain_name     varchar(10)   not null,
    token_id       varchar(256)  not null,
    component_ids  varchar(1000) not null,
    component_nums varchar(1000) not null,
    sig            varchar(132)  not null,
    primary key (chain_name, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `metadata`
(
    chain_name  varchar(10)    not null,
    contract    varchar(42)    not null,
    token_id    varchar(256)   not null,
    description varchar(1000)  not null,
    name        varchar(60)    not null,
    uri         varchar(200)   not null,
    attributes  varchar(10000) not null,
    primary key (contract, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `authentication`
(
    addr      varchar(42) not null,
    auth_code tinyint     not null,
    primary key (addr)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

alter table metadata
    add prev varchar(256) not null default '';