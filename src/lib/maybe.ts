export type Maybe<T, E = string> =
	| {
			success: true
			data: T
	  }
	| {
			success: false
			error: E
	  }
