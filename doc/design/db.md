# Meta-4d.me Backend DB Design Doc

## M4M-NFT Initialize

> save initial attrs and sig

tableName: initialization

| Key            | type          | Desc                                                   | Note                     |
|----------------|---------------|--------------------------------------------------------|--------------------------|
| chain_name     | varchar(10)   | chain name                                             | PK                       |
| token_id       | bigint        | token id of m4m nft                                    | PK                       |
| component_ids  | varchar(1000) | array of component id                                  | such as '1,2,3,4,5,6'    |
| component_nums | varchar(1000) | array of component nums, corresponding to component id | such as '1,2,3,4,5,6'    |
| sig            | varchar(132)  | operator sig                                           | hex-encoded ethereum sig |

