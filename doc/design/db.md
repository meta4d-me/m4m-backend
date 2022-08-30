# Meta-4d.me Backend DB Design Doc

## M4M-NFT Initialize

> save initial attrs and sig

tableName: initialization_${chain_name}

| Key            | type          | Desc                                                                      | Note                     |
|----------------|---------------|---------------------------------------------------------------------------|--------------------------|
| chain_name     | varchar(10)   | chain name                                                                | PK                       |
| token_id       | varchar(256)  | token id of m4m nft, uint256(keccak256(originalNFTAddr, originalTokenId)) | PK                       |
| component_ids  | varchar(1000) | array of component id                                                     | such as '1,2,3,4,5,6'    |
| component_nums | varchar(1000) | array of component nums, corresponding to component id                    | such as '1,2,3,4,5,6'    |
| sig            | varchar(132)  | operator sig                                                              | hex-encoded ethereum sig |

## Metadata

> token metadata

tableName: metadata_${chain_name}

| Key         | type           | Desc              | Note                    |
|-------------|----------------|-------------------|-------------------------|
| chain_name  | varchar(10)    | chain name        |               |
| contract    | varchar(42)    |   contract addr | PK |
| token_id    | varchar(256)   |   token id | PK |
| description | varchar(1000)  | token description |                       |
| name        | varchar(60)    | token name        |                       |
| uri         | varchar(200)   | ifps uri hash     |     |
| attributes  | varchar(10000) | jsonfy attrs      |  |

## Authentication

> who can post request

| Key         | type           | Desc                | Note |
|-------------|----------------|---------------------|------|
| addr        | varchar(42)    | address             |  PK  |
| auth_code   | tinyint        | authentication code |      |
