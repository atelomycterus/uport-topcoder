pragma solidity ^0.4.15;

contract AttestedDataRegistry {

	struct DataDetails {
		string dataHash;
		string attestedDate;//attestedData.exp
		string expiredDate;//attestedData.iat, string format with timezone
	}
	//clientUportId => mapping(dataType => mapping (validatorUportId => DataDetails))) attestedData;
	mapping (string => mapping(string => mapping (string => DataDetails))) attestedData;

	function addAttestedData(string uportId,string validator, string dataType, string dataHash, string attestedDate, string expiredDate) {
		attestedData[uportId][dataType][validator] =  DataDetails(dataHash, attestedDate, expiredDate);
	}

	function getAttestedData(string uportId, string validator, string dataType) constant returns(string, string, string) {
       DataDetails data =  attestedData[uportId][dataType][validator];
       return (data.attestedDate, data.expiredDate, data.dataHash);
  }
}
