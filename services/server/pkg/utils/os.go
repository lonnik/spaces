package utils

import (
	"encoding/json"
	"io"
	"os"
	"spaces-p/pkg/errors"
)

func LoadRecordsFromJSONFile[TRecord any](fileName string) ([]TRecord, error) {
	const op errors.Op = "utils.getRecordsFromFile"

	jsonFile, err := os.Open(fileName)
	if err != nil {
		return nil, errors.E(op, err)
	}
	defer jsonFile.Close()

	newRecordsBytes, err := io.ReadAll(jsonFile)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var newRecords = make([]TRecord, 0)
	if err := json.Unmarshal(newRecordsBytes, &newRecords); err != nil {
		return nil, errors.E(op, err)
	}

	return newRecords, nil
}
