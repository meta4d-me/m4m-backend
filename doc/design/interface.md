# Meta-4d.me Backend DB Design Doc

## M4M-NFT

### Prepare New Attr

method: post

url: api/v1/component/generate

params:

```json
{
  // code of equipment, should be string of number
  "component_id": "",
  // full name of equipment
  "name": "",
  // abbrevation of name
  "symbol": "",
  // ipfs hash
  "uri": "",
  // attributes that compliant Opense
  "attrs": {}
}
```

returns:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> note: No authentication temporary

### Get Initialization Params

method: get

url: api/v1/m4m-nft/initialization?original_addr=xxx&&original_token_id=xxx&&chain_name=xxx

> original_addr: contract address of parsed nft
>
> original_token_id: token id of parsed nft

return:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "m4m_token_id": "81449136432453593952252541924876232285909669905506625386482230805063052117465",
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

> m4m_token_id: token id of m4m NFT
>
> m4m_token_id is type of u256

### Get M4M-NFT Attrs

method: get

url: api/v1/m4m-nft/attrs?m4m_token_id=xxx&&chain_name=xxx

return:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "m4m_token_id": "81449136432453593952252541924876232285909669905506625386482230805063052117465",
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

### Bind Snapshot

bind ipfs hash to m4m-nft

method: post

params:

```json
{
  "m4m_token_id": "",
  "uri": ""
}
```

url: api/v1/m4m-nft/bind-snapshot

return:

```json
{
  "code": "",
  "error": "",
  "data": {}
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
