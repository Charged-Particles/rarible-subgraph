import { Address, Wrapped, JSONValue, Value, log } from '@graphprotocol/graph-ts';

import {
  StandardNFT,
  StandardNftAttributes,
} from '../generated/schema';

import {
  Transfer,
} from '../generated/StandardNFT/ERC721';

import { nftAttributeId } from './helpers/idTemplates';
import { loadOrCreateStandardNFT } from './helpers/loadOrCreateStandardNFT';
import {
  ADDRESS_ZERO,
  hasAttr,
  getStringValue,
  parseJsonFromIpfs
} from './helpers/common';


export function handleTransfer(event: Transfer): void {
  const _nft = loadOrCreateStandardNFT(event.address, event.params.tokenId);
  _nft.owner = event.params.to;
  _nft.save();

  if (event.params.from.toHex() == ADDRESS_ZERO) {
    const jsonData:Wrapped<JSONValue> | null = parseJsonFromIpfs(_nft.metadataUri);
    if (jsonData != null) {
      processNftMetadata(jsonData.inner, Value.fromString(_nft.id));
    }
  }
}


export function processNftMetadata(value: JSONValue, userData: Value): void {
  const standardNftId = userData.toString();
  const standardMetadata = value.toObject();
  if (standardMetadata == null) { return; }

  const _nft = StandardNFT.load(standardNftId);
  if (!_nft) { return; }

  _nft.name             = getStringValue(standardMetadata, 'name');
  _nft.description      = getStringValue(standardMetadata, 'description');
  _nft.external_url     = getStringValue(standardMetadata, 'external_url');
  _nft.icon             = getStringValue(standardMetadata, 'icon');
  _nft.image            = getStringValue(standardMetadata, 'image');
  _nft.symbol           = getStringValue(standardMetadata, 'symbol');

  _nft.save();
}
