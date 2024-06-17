package utils

func SliceContains[T string | int | bool](s []T, item T) bool {
	for _, a := range s {
		if a == item {
			return true
		}
	}

	return false
}

type Predicate[T any] func(T) bool

func FilterSlice[T any](s []T, predicate Predicate[T]) []T {
	var filtered []T

	for _, item := range s {
		if predicate(item) {
			filtered = append(filtered, item)
		}
	}

	return filtered
}
