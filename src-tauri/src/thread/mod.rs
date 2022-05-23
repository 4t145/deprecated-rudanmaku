pub(crate) mod tray;
use tokio::sync::mpsc;

pub trait Manager: Sized + Send + Sync + 'static {
    type Message: Send + std::fmt::Debug;

    fn on_message(&mut self, msg: Self::Message);
    fn init(&mut self);
    fn close(self);
}

pub trait ManagerThread<M: Manager>: Sized + Send + 'static {
    fn unpack(self) -> tokio::task::JoinHandle<(mpsc::Receiver<M::Message>, M)>;

    fn spawn(self) -> tokio::task::JoinHandle<()> {
        let join_handle = tokio::spawn(async move {
            let (mut rx, mut manager) = self.unpack().await.unwrap();
            manager.init();
            while let Some(msg) = rx.recv().await {
                manager.on_message(msg);
            }
            manager.close();
        });
        join_handle
    }
}
