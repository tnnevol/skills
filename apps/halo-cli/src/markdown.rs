//! Markdown to HTML conversion using pulldown-cmark.
use pulldown_cmark::{html, Options, Parser};

/// Convert Markdown text to HTML.
pub fn md_to_html(markdown: &str) -> String {
    let options = Options::empty();
    let parser = Parser::new_ext(markdown, options);
    let mut html_output = String::with_capacity(markdown.len() * 2);
    html::push_html(&mut html_output, parser);
    html_output
}
