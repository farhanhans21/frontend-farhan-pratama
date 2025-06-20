import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Package,
  Percent,
  DollarSign,
  Calculator,
} from "lucide-react";

const fetchCountries = async () => {
  const response = await fetch("http://202.157.176.100:3001/negaras");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log(response);
  return response.json();
};

const fetchPorts = async (countryId) => {
  const response = await fetch(
    `http://202.157.176.100:3001/pelabuhans?filter={"where" : {"id_negara":${countryId}}}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const fetchGoods = async (portId) => {
  const response = await fetch(
    `http://202.157.176.100:3001/barangs?filter={"where" : {"id_pelabuhan":${portId}}}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const data = await fetchCountries();
      return data.map((item) => ({
        id: item.id_negara,
        nama: item.nama_negara,
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: [
      { id: 1, nama: "Indonesia" },
      { id: 2, nama: "Malaysia" },
      { id: 3, nama: "Singapore" },
    ],
  });
};

const usePorts = (countryId) => {
  return useQuery({
    queryKey: ["ports", countryId],
    queryFn: async () => {
      const data = await fetchPorts(countryId);
      return data.map((item) => ({
        id: item.id_pelabuhan,
        nama: item.nama_pelabuhan,
      }));
    },
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: [],
  });
};

const useGoods = (portId) => {
  return useQuery({
    queryKey: ["goods", portId],
    queryFn: () => fetchGoods(portId),
    enabled: !!portId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: [],
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Autocomplete = ({
  value,
  onChange,
  options = [],
  placeholder,
  displayKey = "nama",
  disabled = false,
  icon: Icon,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, displayKey]);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          type="text"
          className={`w-full px-4 py-3 ${
            Icon ? "pl-10" : ""
          } border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
          }`}
          placeholder={placeholder}
          value={value ? value[displayKey] || "" : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled || isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && !disabled && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <div
              key={option.id || index}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelect(option)}
            >
              <div className="font-medium text-gray-900">
                {option[displayKey]}
              </div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-1">
                  {option.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [selectedGood, setSelectedGood] = useState(null);

  const [editableDiscount, setEditableDiscount] = useState(0);
  const [editablePrice, setEditablePrice] = useState(0);

  const {
    data: countries = [],
    isLoading: countriesLoading,
    error: countriesError,
  } = useCountries();

  const {
    data: ports = [],
    isLoading: portsLoading,
    error: portsError,
  } = usePorts(selectedCountry?.id);

  const {
    data: goods = [],
    isLoading: goodsLoading,
    error: goodsError,
  } = useGoods(selectedPort?.id);

  useEffect(() => {
    if (selectedGood) {
      setEditableDiscount(selectedGood.diskon || 0);
      setEditablePrice(selectedGood.harga || 0);
    } else {
      setEditableDiscount(0);
      setEditablePrice(0);
    }
  }, [selectedGood]);

  const calculateTotal = (price, discount) => {
    return price * (discount / 100);
  };

  const total = selectedGood
    ? calculateTotal(editablePrice, editableDiscount)
    : 0;

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedPort(null);
    setSelectedGood(null);
  };

  const handlePortChange = (port) => {
    setSelectedPort(port);
    setSelectedGood(null);
  };

  const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setEditableDiscount(Math.max(0, Math.min(100, value)));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setEditablePrice(parseInt(value) || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Aplikasi Pelabuhan
          </h1>
        </div>

        {(countriesError || portsError || goodsError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">
              Error Loading Data
            </h3>
            {countriesError && (
              <p className="text-red-600 text-sm">
                Countries: {countriesError.message}
              </p>
            )}
            {portsError && (
              <p className="text-red-600 text-sm">
                Ports: {portsError.message}
              </p>
            )}
            {goodsError && (
              <p className="text-red-600 text-sm">
                Goods: {goodsError.message}
              </p>
            )}
            <p className="text-red-500 text-sm mt-2">
              Using fallback data where available.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Negara
              </label>
              <Autocomplete
                value={selectedCountry}
                onChange={handleCountryChange}
                options={countries}
                placeholder="Pilih negara..."
                displayKey="nama"
                icon={Search}
                disabled={countriesLoading}
                isLoading={countriesLoading}
              />
              {countriesLoading && (
                <p className="text-sm text-blue-500 mt-1">
                  Loading countries...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Pelabuhan
              </label>
              <Autocomplete
                value={selectedPort}
                onChange={handlePortChange}
                options={ports}
                placeholder={
                  selectedCountry
                    ? "Pilih pelabuhan..."
                    : "Pilih negara terlebih dahulu"
                }
                displayKey="nama"
                icon={Search}
                disabled={!selectedCountry || portsLoading}
                isLoading={portsLoading}
              />
              {portsLoading && (
                <p className="text-sm text-blue-500 mt-1">Loading ports...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Barang
              </label>
              <Autocomplete
                value={selectedGood}
                onChange={setSelectedGood}
                options={goods.map((good) => ({
                  ...good,
                  nama: `${good.id_barang} - ${good.nama_barang}`,
                  description: good.description,
                }))}
                placeholder={
                  selectedPort
                    ? "Pilih barang..."
                    : "Pilih pelabuhan terlebih dahulu"
                }
                displayKey="nama"
                icon={Search}
                disabled={!selectedPort || goodsLoading}
                isLoading={goodsLoading}
              />
              {goodsLoading && (
                <p className="text-sm text-blue-500 mt-1">Loading goods...</p>
              )}
            </div>

            {selectedGood && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Barang
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  value={selectedGood.description}
                  readOnly
                  rows={3}
                />
              </div>
            )}

            {selectedGood && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Percent className="inline w-4 h-4 mr-1" />
                    Discount (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={editableDiscount}
                      onChange={handleDiscountChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Original: {selectedGood.diskon}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Harga
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                      Rp
                    </span>
                    <input
                      type="text"
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={editablePrice.toLocaleString("id-ID")}
                      onChange={handlePriceChange}
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Original: {formatCurrency(selectedGood.harga)}
                  </p>
                </div>
              </div>
            )}

            {selectedGood && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calculator className="inline w-4 h-4 mr-1" />
                  Total (Harga × Discount ÷ 100)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 text-green-800 font-bold text-lg"
                    value={formatCurrency(total)}
                    readOnly
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="text-xs text-green-600">
                      {formatCurrency(editablePrice)} × {editableDiscount}%
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Calculation: {editablePrice.toLocaleString("id-ID")} × (
                  {editableDiscount}% ÷ 100) = {formatCurrency(total)}
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedCountry && selectedPort && selectedGood && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Negara:</span>
                  <p className="text-gray-600">{selectedCountry.nama}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Pelabuhan:
                  </span>
                  <p className="text-gray-600">{selectedPort.nama}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Barang:</span>
                  <p className="text-gray-600">
                    {selectedGood.id_barang} - {selectedGood.nama_barang}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Discount:</span>
                  <p className="text-gray-600">
                    {editableDiscount}%
                    {editableDiscount !== selectedGood.diskon && (
                      <span className="text-orange-500 text-sm ml-2">
                        (Modified from {selectedGood.diskon}%)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Harga:</span>
                  <p className="text-gray-600">
                    {formatCurrency(editablePrice)}
                    {editablePrice !== selectedGood.harga && (
                      <span className="text-orange-500 text-sm ml-2">
                        (Modified from {formatCurrency(selectedGood.harga)})
                      </span>
                    )}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <p className="text-green-600 font-bold text-lg">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
