pub trait FileInput {
    fn slice(&self, start: usize, end: usize) -> Result<Vec<u8>, std::io::Error>;
}
