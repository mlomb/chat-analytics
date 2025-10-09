use std::{
    cell::RefCell,
    io::{Read, Seek, SeekFrom},
    rc::Rc,
};

// Wrapper that tracks bytes read using a shared counter
pub struct ProgressReader<R> {
    inner: R,
    bytes_read: Rc<RefCell<u64>>,
}

impl<R: Read + Seek> ProgressReader<R> {
    pub fn new(inner: R) -> (Self, Rc<RefCell<u64>>) {
        let bytes_read = Rc::new(RefCell::new(0u64));
        (
            Self {
                inner,
                bytes_read: bytes_read.clone(),
            },
            bytes_read,
        )
    }
}

impl<R: Read> Read for ProgressReader<R> {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        let n = self.inner.read(buf)?;
        *self.bytes_read.borrow_mut() += n as u64;
        Ok(n)
    }
}

impl<R: Seek> Seek for ProgressReader<R> {
    fn seek(&mut self, pos: SeekFrom) -> std::io::Result<u64> {
        let result = self.inner.seek(pos)?;
        // Update the shared counter when seeking
        *self.bytes_read.borrow_mut() = result;
        Ok(result)
    }
}
