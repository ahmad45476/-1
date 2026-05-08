import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ArtWayNFT from '../../../blockchain/artifacts/contracts/ArtWayNFT.sol/ArtWayNFT.json';

const WalletContext = createContext();
export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  // حالات المحفظة الأساسية
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [networkReady, setNetworkReady] = useState(true);
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);

  // حالات الأرصدة
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [usdBalance, setUsdBalance] = useState('0');
  const [ethPrice, setEthPrice] = useState(null);

  // حالة الـ Token
  const [tokenAvailable, setTokenAvailable] = useState(false);

  // ✅ عنوان العقد الصحيح
  const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x38': 'BSC Mainnet',
      '0x7A69': 'Hardhat Local',
      '0x7a69': 'Hardhat Local'
    };
    return networks[chainId] || `شبكة ${parseInt(chainId, 16)}`;
  };

  // جلب سعر ETH
  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      const price = data.ethereum.usd;
      setEthPrice(price);
      console.log('💰 سعر ETH:', price, 'USD');
      return price;
    } catch (err) {
      console.error('فشل جلب سعر ETH:', err);
      return 3000;
    }
  };

  useEffect(() => {
    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // جلب رصيد ETH
  const fetchBalances = async (userAddress = address, customProvider = provider) => {
    if (!userAddress || !customProvider) return;

    try {
      const balanceWei = await customProvider.getBalance(userAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setEthBalance(balanceEth);
      console.log(`💰 رصيد ETH: ${balanceEth} ETH`);
      
      // تحديث USD balance
      if (ethPrice) {
        const usdValue = parseFloat(balanceEth) * ethPrice;
        setUsdBalance(usdValue.toFixed(2));
      }
    } catch (err) {
      console.error('فشل جلب الرصيد:', err);
    }
  };

  // دالة فارغة للـ Token (لأنه غير موجود على الشبكة المحلية)
  const getTokenBalance = async () => {
    setTokenAvailable(false);
    setTokenBalance('0');
    return '0';
  };

  // معالجة تغيير الحساب
  const handleAccountsChanged = (accounts) => {
    console.log('تغير الحساب:', accounts);
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      if (!isManualDisconnect) {
        connectMetaMask(false);
      }
    }
  };

  // معالجة تغيير الشبكة
  const handleChainChanged = (chainId) => {
    console.log('تغيرت الشبكة إلى:', chainId);
    const name = getNetworkName(chainId);
    setCurrentNetwork(chainId);
    setNetworkName(name);
    if (address && !isManualDisconnect) {
      fetchBalances(address, provider);
    }
  };

  // معالجة قطع الاتصال
  const handleDisconnect = () => {
    console.log('MetaMask disconnected');
    disconnectWallet();
  };

  // الاتصال بالمحفظة
  const connectMetaMask = async (requestAccounts = true) => {
    try {
      if (!window.ethereum) throw new Error('MetaMask غير مثبت');

      setIsManualDisconnect(false);
      setNetworkReady(true);

      let accounts;

      if (requestAccounts) {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
      } else {
        accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
      }

      if (!accounts.length) throw new Error('لم يتم اختيار حساب');

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const name = getNetworkName(chainId);
      setCurrentNetwork(chainId);
      setNetworkName(name);

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      const userAddress = await signer.getAddress();

      setProvider(ethProvider);
      setWallet(signer);
      setAddress(userAddress);
      setIsMetaMaskConnected(true);
      setError('');

      console.log('✅ متصل بالمحفظة:', userAddress);
      console.log('🌐 على شبكة:', name);

      await fetchBalances(userAddress, ethProvider);

      return { success: true, address: userAddress };
    } catch (err) {
      console.error('❌ فشل الاتصال:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // إنشاء العقد
  const initContract = async () => {
    if (!wallet) return;
    try {
      console.log('🔄 محاولة إنشاء عقد NFT على:', networkName || 'الشبكة الحالية');
      console.log('📞 عنوان العقد المستخدم:', CONTRACT_ADDRESS);
      
      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ArtWayNFT.abi,
        wallet
      );
      
      console.log('✅ عقد NFT جاهز');
      console.log('📞 عنوان العقد الفعلي:', nftContract.target);
      
      setContract(nftContract);
    } catch (err) {
      console.error('❌ فشل إنشاء عقد NFT:', err);
      setError('فشل إنشاء العقد: ' + err.message);
    }
  };

  // إنشاء العقد عند توفر المحفظة
  useEffect(() => {
    if (wallet) {
      initContract();
    }
  }, [wallet, networkName]);

  // إعداد مستمعي MetaMask
  useEffect(() => {
    if (!window.ethereum) {
      setError('يرجى تثبيت MetaMask');
      setNetworkReady(false);
      return;
    }

    setNetworkReady(true);

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // قطع الاتصال
  const disconnectWallet = () => {
    setIsManualDisconnect(true);
    setWallet(null);
    setAddress(null);
    setProvider(null);
    setContract(null);
    setEthBalance('0');
    setTokenBalance('0');
    setUsdBalance('0');
    setIsMetaMaskConnected(false);
    setCurrentNetwork('');
    setNetworkName('');
    setTokenAvailable(false);
    console.log('🔌 تم قطع الاتصال');
  };

  // دالة التصحيح
  const logDebugInfo = async () => {
    console.log("MetaMask متصل؟", isMetaMaskConnected);
    console.log("العنوان الحالي:", address);
    
    if (provider) {
      try {
        const network = await provider.getNetwork();
        console.log("شبكة:", network.name, "Chain ID:", network.chainId.toString());
      } catch (err) {
        console.log("فشل جلب معلومات الشبكة:", err);
      }
    } else {
      console.log("⚠️ Provider غير متاح");
    }
  };

  useEffect(() => {
    if (isMetaMaskConnected) {
      logDebugInfo();
    }
  }, [isMetaMaskConnected, address, provider]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        address,
        contract,
        error,
        provider,
        balance: usdBalance,
        ethBalance,
        tokenBalance,
        usdBalance,
        tokenAvailable,
        currentNetwork,
        networkName,
        isMetaMaskConnected,
        isConnected: isMetaMaskConnected,
        networkReady,
        ethPrice,
        connectMetaMask: () => connectMetaMask(true),
        connectWallet: () => connectMetaMask(true),
        disconnectWallet,
        getBalance: () => usdBalance,
        refreshBalance: () => fetchBalances(address, provider),
        fetchBalances,
        fetchEthPrice,
        getTokenBalance,
        logDebugInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};