// Executor (() => Unit) => Unit
// Future (A => Unit) => Unit
// Par (Executor => Future)

const Par = (() => {
	// Executor => Pair[A] => A
	const run = e => p => cb => p(e)(a => cb(a))

	// Executor => (() => Unit) => Unit
	const execute = e => r => e(r)

	// A => Par[A]
	const unit = a => e => cb => cb(a)

	// Par[A] => (A => Par[B]) => Par[B] 
	const flatMap = p => f => e => cb => p(e)(a => f(a)(e)(cb))

	// Par[A] => (A => B) => Par[B]
	const map = p => f => e => cb => p(e)(a => execute(e)(() => cb(f(a))))

	// (Par[A], Par[B]) => ((A, B) => C) => Par[C]
	const map2 = (p, p2) => f => e => cb => {
		let ar = undefined
		let br = undefined
		setTimeout(() => p(e)(a => {
			if (br !== undefined) {
				execute(e)(() => cb(f(a, br)))
			} else {
				ar = a
			}
		}))
		setTimeout(() => p2(e)(b => {
			if (ar !== undefined) {
				execute(e)(() => cb(f(ar, b)))
			} else {
				br = b
			}
		}))
	}

	// (() => Par[A]) => Executor => Par[A]
	const fork = a => e => cb => execute(e)(() => a()(e)(cb))

	// ((A => Unit) => Unit) => Par[A]
	const async = f => e => cb => f(cb) 

	// List[Par[A]] => Par[List[A]]
	const sequence = as => {
		if (as.length === 0) return unit([])
		const [h, ...t] = as
		return map2(h, fork(() => sequence(t)))((a, b) => [a, ...b])
	}

	return {
		run,
		unit,
		flatMap,
		map,
		map2,
		fork,
		sequence,
		async
	}
})()
