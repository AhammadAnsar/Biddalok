import React from 'react';
import { MasterDataSettings as MasterDataComponent } from '../components/MasterDataSettings';

export const MasterDataSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <MasterDataComponent />
    </div>
  );
};

export default MasterDataSettingsPage;
