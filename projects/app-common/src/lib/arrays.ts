export class Arrays {
	/**
     * returns true if any of items returns TRUE
	 * if array is empty, this function returns FALSE
     */
    static any<T>(data: T[], condition: (x: T) => boolean) {
        for (var i = 0; i < data.length; i++) {
            if (condition(data[i]))
                return true;
        }
        return false;
    }

	/**
	 * returns true if all items in array returns true
	 * if array is empty, this function
	 */
    static all<T>(data: T[], filter: (x: T) => boolean) {
        for (var i = 0; i < data.length; i++) {
            if (!filter(data[i]))
                return false;
        }
        return true;
    }
	/**
	 * returns true if both arrays are same, i.e. lengths are same and all items equals to appropriate item in second array
	 */
    static sequenceEquals<T>(firstArray: T[], secondArray: T[]): boolean {
        if (firstArray.length != secondArray.length)
            return false

        for (let i = 0; i < firstArray.length; i++) {
            if (firstArray[i] != secondArray[i])
                return false;
        }

        return true;
    }
	/**
	 * returns true, if there are 0 or 1 items or all items in collection equals
	 */
    static allSame<T>(data: T[]): boolean {
        if (data.length <= 1)
            return true;
        var first = data[0];
        return Arrays.all(data, x => x == first);
    }

	/**
	 * returns new, sorted array
	 */
    static sortBy<T>(data: T[], ...selectors: ((item: T) => any)[]): T[] {
        var result = [].concat(data);
        result.sort((a, b) => {
            var r = 0;
            for (var i = 0; i < selectors.length; i++) {
                var sa = selectors[i](a);
                var sb = selectors[i](b);
                r = sa === sb ? 0 : sa < sb ? -1 : 1;
                if (r != 0)
                    break;
            }
            return r;
        });
        return result;
    }

	/**
	 * returns array without duplicities
	 */
    static distinct<T>(data: T[], selector: (item: T) => any = null): T[] {
        if (selector == null) {
            selector = x => x;
        }
        var result: T[] = [];
        var keys = {};
        data.forEach(x => {
            var key = selector(x);
            if (!keys[key]) {
                keys[key] = 1;
                result.push(x);
            }
        });
        return result;
    }
	/**
	 * returns last item in array or undefined
	 */
    static last<T>(data: T[]): T {
        if (data.length == 0)
            return undefined;
        return data[data.length - 1];
    }
	/**
	 * returns unique values from given array
	 * WARNING, if there are string-converted duplicates (1 and '1' and "1")
	 */
    static unique<T>(xs: T[]): T[] {
        var seen = {} as any;
        return xs.filter((x) => {
            if (seen[x])
                return
            seen[x] = true
            return x
        });
    }
}