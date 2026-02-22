import type { MergeDeep } from "type-fest";

export function waitForFunction<K extends keyof typeof window>(
	key: K
): Promise<void> {
	if (!Object.prototype.hasOwnProperty.call(unsafeWindow, key)) {
		return new Promise((resolve) => {
			const interval = setInterval(() => {
				if (Object.prototype.hasOwnProperty.call(unsafeWindow, key)) {
					clearInterval(interval);
					resolve();
				}
			}, 100);
		});
	}
	return Promise.resolve();
}
export function waitForElement<T extends HTMLElement>(
	selector: string
): Promise<T> {
	const element = document.querySelector<T>(selector);
	if (!element) {
		return new Promise((resolve) => {
			const interval = setInterval(() => {
				const element = document.querySelector<T>(selector);
				if (element) {
					clearInterval(interval);
					resolve(element);
				}
			}, 100);
		});
	}
	return Promise.resolve(element);
}

// TODO remove this when its no longer cause i will probably want to render markdown
export const cleanMessageContent = (content: string) =>
	content.replace(/\[.*\]/g, "").replace(/&nbsp;/g, " ");

type HookableWindow = {
	[K in keyof Window]: Window[K] extends (...args: unknown[]) => unknown
		? Window[K]
		: never;
};

type CopiedFunction<F extends (...args: unknown[]) => unknown> = F extends (
	...args: infer A
) => infer R
	? (...args: A) => R
	: never;
export async function hookFunction<K extends keyof HookableWindow>(
	key: K,
	callback: (
		originalFunction: CopiedFunction<Window[K]>,
		...args: Parameters<Window[K]>
	) => void
) {
	await waitForFunction(key);
	// Copy the original function
	const originalFunction = (
		unsafeWindow[key] as CopiedFunction<Window[K]>
	).bind(unsafeWindow) as CopiedFunction<Window[K]>;
	unsafeWindow[key] = ((...args: Parameters<Window[K]>) =>
		callback(originalFunction, ...args)) as Window[K];
}

export function log(...args: unknown[]) {
	const text = [
		"[yno-translate]",
		...args.map((x) =>
			typeof x === "string" ? x : JSON.stringify(x, null, 4)
		),
	].join(" ");
	GM_log(text);
	if (Object.prototype.hasOwnProperty.call(unsafeWindow, "showToastMessage"))
		try {
			unsafeWindow.showToastMessage(text);
		} catch {
			// ignore
		}
}

export const sendHttpGetRequest = <T extends Record<string, unknown>>(
	url: string
) =>
	new Promise<T>((resolve, reject) => {
		GM_xmlhttpRequest({
			method: "GET",
			url,
			onload: (response) => {
				const obj = JSON.parse(response.responseText!) as T;
				resolve(obj);
			},
			onerror: reject,
			anonymous: true,
		});
	});

export function pcall<T extends (...args: unknown[]) => unknown>(
	func: T
): [undefined, ReturnType<T>] | [Error, undefined] {
	try {
		return [undefined, func() as ReturnType<T>];
	} catch (error) {
		return [error as Error, undefined];
	}
}

type Awaited<T extends PromiseLike<unknown>> = T extends PromiseLike<infer U>
	? U
	: never;

export async function pawait<T extends Promise<unknown>>(
	promise: T
): Promise<[undefined, Awaited<T>] | [Error, undefined]> {
	try {
		return [undefined, (await promise) as Awaited<T>];
	} catch (error) {
		return [error as Error, undefined as never];
	}
}

export function deepMerge<
	T extends Record<string, unknown>,
	U extends Record<string, unknown>
>(target: T, ...objects: Partial<U>[]): MergeDeep<T, U> {
	for (const object of objects) {
		for (const key in object) {
			if (typeof object[key] === "object") {
				if (!target[key]) target[key] = {} as T[typeof key];
				deepMerge(
					target[key] as Record<string, unknown>,
					object[key] as Record<string, unknown>
				);
			} else {
				target[key] = object[key] as T[typeof key];
			}
		}
	}
	return target as MergeDeep<T, U>;
}
