import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as Network from 'expo-network';

interface NetworkContextType {
  isOnline: boolean;
  isChecking: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true, isChecking: false });

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkConnectivity = async () => {
      try {
        setIsChecking(true);
        const state = await Network.getNetworkStateAsync();
        setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
      } catch {
        setIsOnline(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnectivity();
    intervalId = setInterval(checkConnectivity, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isChecking }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextType {
  return useContext(NetworkContext);
}
