create table if not exists `initialization`
(
    chain_name     varchar(10)   not null,
    token_id       bigint        not null,
    component_ids  varchar(1000) not null,
    component_nums varchar(1000) not null,
    sig            varchar(132)  not null,
    primary key (chain_name, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
