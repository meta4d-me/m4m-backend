# Meta-4d.me Backend DB Design Doc

## M4M-NFT

### Get Initialization Params

method: get

url: api/v1/m4m-nft/initialization?token_id=xxx&&chain_name=xxx

return:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "token_id": "xxx",
      "chain_name": "xxx",
      "component_ids": [
        1,
        2,
        3,
        4
      ],
      "component_nums": [
        3,
        3,
        1,
        1
      ],
      "sig": "0x12ad12da12da12da12da12d1a2da121da2d1a2d1a21da21d2a1d2a1d2a1d2a1d2a1d2a1d2a1d2a1d2a1d21a"
    }
  ]
}
```

### Get M4M-NFT Attrs

method: get

url: api/v1/m4m-nft/attrs?token_id=xxx&&chain_name=xxx

return:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "token_id": "xxx",
      "chain_name": "xxx",
      "component_ids": [
        1,
        2,
        3,
        4
      ],
      "component_nums": [
        3,
        3,
        1,
        1
      ]
    }
  ]
}
```

## Return Value

uniform return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

### code

`code=1` means that success, others is failed。

### error

when `code!=1`, return error info。

### data

response result.
