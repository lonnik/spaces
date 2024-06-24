package utils

func SliceContains[T string | int | bool](s []T, item T) bool {
	for _, a := range s {
		if a == item {
			return true
		}
	}

	return false
}
