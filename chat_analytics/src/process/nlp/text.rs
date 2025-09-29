use std::sync::LazyLock;

use regex::Regex;
use unicode_normalization::UnicodeNormalization;

static EMOJI_VARIANT_FORM_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"[\u{FE0F}\u{FE0E}]").unwrap());

/// Normalizes the text using `NFKC` and removes other unwanted characters
pub fn normalize_text(text: &str) -> String {
    // normalize the content using NFKC (we want the compositions)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    let text = text.nfkc().collect::<String>();

    // remove variant forms from emojis
    // U+FE0E → text variant
    // U+FE0F → graphics variant (colors)
    // See: https://stackoverflow.com/questions/38100329/what-does-u-ufe0f-in-an-emoji-mean-is-it-the-same-if-i-delete-it
    let text = EMOJI_VARIANT_FORM_REGEX.replace_all(&text, "");

    // change all whitespace to one space (important for the lang detector, newlines bad)
    text.split_whitespace().collect::<Vec<&str>>().join(" ")
}
