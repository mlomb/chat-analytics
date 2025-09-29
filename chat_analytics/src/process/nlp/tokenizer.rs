use std::sync::OnceLock;

use regex::Regex;

#[derive(Debug, Clone, PartialEq)]
pub enum Tag {
    Code,
    Url,
    Email,
    Mention,
    Emoji,
    CustomEmoji,
    Word,
    Unknown,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Token {
    pub text: String,
    pub tag: Tag,
}

struct TokenMatcher {
    tag: Tag,
    regex: Regex,
    transform: Option<fn(&str) -> String>,
}

impl TokenMatcher {
    pub fn new(tag: Tag, pattern: &str, transform: Option<fn(&str) -> String>) -> Self {
        let regex = Regex::new(pattern).expect("regex not to be valid");
        Self {
            tag,
            regex,
            transform,
        }
    }
}

static MATCHERS: OnceLock<[TokenMatcher; 7]> = OnceLock::new();

fn get_matchers() -> &'static [TokenMatcher] {
    MATCHERS.get_or_init(|| {
        // the order of the matchers is critical
        [
            // should we handle it this way?
            // source code, ascii art, some other stuff should not be included
            TokenMatcher::new(Tag::Code, r"```[^`]*```", None),
            // match URLs
            TokenMatcher::new(
                Tag::Url,
                r"https?://[^\s]+", // Discord's regex to match URLs
                None,
            ),
            // Emails matcher must be before @mentions matcher to avoid false positives
            TokenMatcher::new(
                Tag::Email,
                // Match emails.... long story here
                r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
                None,
            ),
            TokenMatcher::new(
                Tag::Mention,
                // match @mentions
                r"(^|\s)@[\p{L}_0-9]+",
                Some(|s| s.trim().strip_prefix('@').unwrap_or(s).to_string()),
            ),
            TokenMatcher::new(
                Tag::Emoji,
                // match emojis 🔥
                // TODO: change for the proper regex from the npm package
                r"[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F0F5}]|[\u{1F200}-\u{1F2FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]",
                None,
            ),
            TokenMatcher::new(
                Tag::CustomEmoji,
                // match custom emojis :pepe:
                r":\w+:",
                Some(|s| {
                    s.strip_prefix(':')
                        .and_then(|s| s.strip_suffix(':'))
                        .unwrap_or(s)
                        .to_string()
                }),
            ),
            // TODO: match words on languages that words are one character (help wanted)
            // See: https://github.com/facebookresearch/fastText/blob/master/docs/crawl-vectors.md#tokenization
            TokenMatcher::new(
                Tag::Word,
                // match words;
                // words can have numbers (k8s, i18n, etc.) (is this a mistake?)
                r"(?:\p{L}[\p{L}'0-9-]*[\p{L}0-9])|\p{L}",
                None,
            ),
        ]
    })
}

#[derive(Debug)]
pub enum SplitResult {
    Text(String),
    Token(Token),
}

/// Splits the input string using one [`TokenMatcher`] into a list of strings and tokens where:
/// - strings are the parts of the input that do not match the matcher (trimmed)
/// - tokens are the parts of the input that do match the matcher ([`Token`](struct.Token.html))
///
/// For example, if the matcher matches emojis:
///  - "hello world" -> ["hello world"]
///  - "😃" -> [{ ..."😃" }]
///  - "notemoji 😃 notemoji" -> ["notemoji", { ..."😃" }, "notemoji"]
fn split_by_token(input: &str, matcher: &TokenMatcher) -> Vec<SplitResult> {
    let mut result = Vec::new();
    let mut last_end = 0;

    for m in matcher.regex.find_iter(input) {
        // add unmatched text before this match
        if m.start() > last_end {
            let unmatched = input[last_end..m.start()].trim();
            if !unmatched.is_empty() {
                result.push(SplitResult::Text(unmatched.to_string()));
            }
        }

        // add the matched token
        result.push(SplitResult::Token(Token {
            text: if let Some(transform) = matcher.transform {
                transform(m.as_str())
            } else {
                m.as_str().to_string()
            },
            tag: matcher.tag.clone(),
        }));

        last_end = m.end();
    }

    // add any remaining unmatched text
    if last_end < input.len() {
        let remaining = input[last_end..].trim();
        if !remaining.is_empty() {
            result.push(SplitResult::Text(remaining.to_string()));
        }
    }

    result
}

/// Tokenizes a string recursively.
///
/// It is assumed that all matchers with index `< matcherIndex` have already been
/// tried and failed to match, so we are clear to test for matchers `>= matcherIndex`.
fn tokenize_step(input: &str, matcher_index: usize, matchers: &[TokenMatcher]) -> Vec<Token> {
    if matcher_index >= matchers.len() {
        // no more matchers to try, mark as unknown
        return vec![Token {
            text: input.to_string(),
            tag: Tag::Unknown,
        }];
    }

    split_by_token(input, &matchers[matcher_index])
        .into_iter()
        .flat_map(|elem| match elem {
            // continue tokenizing with the next matcher
            SplitResult::Text(text) => tokenize_step(&text, matcher_index + 1, matchers),
            SplitResult::Token(token) => vec![token],
        })
        .collect()
}

/// Tokenizes a string into a list of [`Token`]s
pub fn tokenize(input: &str) -> Vec<Token> {
    let matchers = get_matchers();
    tokenize_step(input, 0, matchers)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tokenize_basic() {
        let input = "Hello world!";
        let tokens = tokenize(input);

        assert_eq!(tokens.len(), 3);
        assert_eq!(tokens[0].text, "Hello");
        assert_eq!(tokens[0].tag, Tag::Word);
        assert_eq!(tokens[1].text, "world");
        assert_eq!(tokens[1].tag, Tag::Word);
        assert_eq!(tokens[2].text, "!");
        assert_eq!(tokens[2].tag, Tag::Unknown);
    }

    #[test]
    fn test_tokenize_with_mention() {
        let input = "Hello @user123!";
        let tokens = tokenize(input);

        assert_eq!(tokens.len(), 3);
        assert_eq!(tokens[0].text, "Hello");
        assert_eq!(tokens[0].tag, Tag::Word);
        assert_eq!(tokens[1].text, "user123");
        assert_eq!(tokens[1].tag, Tag::Mention);
        assert_eq!(tokens[2].text, "!");
        assert_eq!(tokens[2].tag, Tag::Unknown);
    }

    #[test]
    fn test_tokenize_with_url() {
        let input = "Check out https://example.com";
        let tokens = tokenize(input);

        assert_eq!(tokens.len(), 3);
        assert_eq!(tokens[0].text, "Check");
        assert_eq!(tokens[0].tag, Tag::Word);
        assert_eq!(tokens[1].text, "out");
        assert_eq!(tokens[1].tag, Tag::Word);
        assert_eq!(tokens[2].text, "https://example.com");
        assert_eq!(tokens[2].tag, Tag::Url);
    }

    #[test]
    fn test_tokenize_with_email() {
        let input = "Contact me at user@example.com";
        let tokens = tokenize(input);

        assert_eq!(tokens.len(), 4);
        assert_eq!(tokens[0].text, "Contact");
        assert_eq!(tokens[0].tag, Tag::Word);
        assert_eq!(tokens[1].text, "me");
        assert_eq!(tokens[1].tag, Tag::Word);
        assert_eq!(tokens[2].text, "at");
        assert_eq!(tokens[2].tag, Tag::Word);
        assert_eq!(tokens[3].text, "user@example.com");
        assert_eq!(tokens[3].tag, Tag::Email);
    }

    #[test]
    fn test_tokenize_with_custom_emoji() {
        let input = "That's cool :pepe:";
        let tokens = tokenize(input);

        assert_eq!(tokens.len(), 3);
        assert_eq!(tokens[0].text, "That's");
        assert_eq!(tokens[0].tag, Tag::Word);
        assert_eq!(tokens[1].text, "cool");
        assert_eq!(tokens[1].tag, Tag::Word);
        assert_eq!(tokens[2].text, "pepe");
        assert_eq!(tokens[2].tag, Tag::CustomEmoji);
    }
}
