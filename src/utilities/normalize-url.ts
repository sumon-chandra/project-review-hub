import AppError from "./app-error.js";

/**
 * Normalizes an HTTP/HTTPS URL for consistent storage and uniqueness comparison.
 * - Trims whitespace
 * - Ensures valid http/https protocol
 * - Lowercases protocol and hostname
 * - Strips default ports (:80, :443)
 * - Removes trailing slash from pathname (unless root)
 * - Removes trailing '.git' suffix for repository URLs
 * - Preserves query parameters and hash fragments if present
 */
export const normalizeUrl = (rawUrl: string, fieldName = "URL"): string => {
	if (!rawUrl || typeof rawUrl !== "string") {
		throw AppError.badRequest(`${fieldName} must be a non-empty string.`);
	}

	const trimmed = rawUrl.trim();

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		throw AppError.badRequest(`${fieldName} is not a valid URL: "${rawUrl}"`);
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw AppError.badRequest(`${fieldName} must use http or https protocol.`);
	}

	let pathname = parsed.pathname;

	// Normalize .git suffix on repo paths (e.g., github.com/user/repo.git -> github.com/user/repo)
	if (pathname.endsWith(".git")) {
		pathname = pathname.slice(0, -4);
	}

	// Remove trailing slash if path is longer than "/"
	if (pathname.length > 1 && pathname.endsWith("/")) {
		pathname = pathname.slice(0, -1);
	}

	parsed.pathname = pathname;

	// Remove default ports
	if ((parsed.protocol === "http:" && parsed.port === "80") || (parsed.protocol === "https:" && parsed.port === "443")) {
		parsed.port = "";
	}

	return parsed.toString();
};

export const isValidHttpUrl = (rawUrl: string): boolean => {
	try {
		const parsed = new URL(rawUrl.trim());
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
};

export default normalizeUrl;
