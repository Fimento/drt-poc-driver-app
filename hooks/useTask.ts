type TaskHandler = () => Promise<void>;
type HookOptions = {
  isReady: boolean;
};

const useTaskFactory = (
  startTask: TaskHandler,
  stopTask: TaskHandler,
) => ({ isReady }: HookOptions) => {
  if (!isReady) return;

  startTask().catch((e) => console.error(e));

  return () => {
    stopTask().catch((e) => console.error(e));
  }
}

export default useTaskFactory;
