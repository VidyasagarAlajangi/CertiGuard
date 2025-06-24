import React from 'react';
import VerifyById from '../components/VerifyById';
import VerifyByQR from '../components/VerifyByQR';

const VerifyPage = () => {
  return (
    <div className="pb-24 pt-30 bg-gray-50 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Certificate Verification</h1>
        <div >
          <div className="bg-white p-8 rounded-lg shadow-lg mb-10">
            <VerifyById />
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <VerifyByQR />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage; 