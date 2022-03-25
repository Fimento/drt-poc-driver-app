import { useEffect } from 'react';

type TaskHandler = () => Promise<void>;
type HookOptions = {
  isReady: boolean;
};

const useTaskFactory = (
  startTask: TaskHandler,
  stopTask: TaskHandler,
) => ({ isReady }: HookOptions) => {
  useEffect(() => {
    if (!isReady) return;

    startTask().catch((e) => console.error(e));

    return () => {
      stopTask().catch((e) => console.error(e));
    }
  }, [isReady]);

}

export default useTaskFactory;
