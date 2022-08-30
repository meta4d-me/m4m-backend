# Meta-4d.me Backend DB Design Doc

## M4M-NFT

### Prepare New Component

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

### Get Component Status

method: get

url: api/v1/component/status/:component_id

returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "status": 1
  }
}
```

| status | desc |
| --- | --- |
| 0 | pending, wait tx confirmed |
| 1 | success, created |
| 2 | create failed |

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

url: api/v1/m4m-nft/bind-snapshot

method: post

params:

```json
{
  "m4m_token_id": "",
  "uri": ""
}
```

return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> note: No authentication temporary

### Get M4M-NFT Metadata

Return the metadata, compliant with opensea

> refer: https://docs.opensea.io/docs/metadata-standards

method: get

url: api/tokenuri/:contract/:token_id

> example: https://api.meta-4d.me/api/tokenuri/0xb6bb4812a8e075cbad0128e318203553c4ca463d/0

return:

```json
{
  "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.",
  "external_url": "https://meta-4d.me",
  "image": "https://ipfs.io/.....",
  "name": "M4M NFT XXXX",
  "attributes": [
    {},
    {},
    {}
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
