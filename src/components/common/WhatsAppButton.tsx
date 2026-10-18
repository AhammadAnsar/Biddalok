import React from 'react';
import { getWhatsAppUrl } from '../../utils/whatsapp';

interface WhatsAppButtonProps {
 mobile?: string;
 name?: string;
 className?: string;
 showText?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
 mobile,
 name,
 className = '',
 showText = false,
}) => {
 const url = getWhatsAppUrl(mobile, name ? `Hello ${name}, regarding school updates:` : undefined);

 if (!url) return null;

 return (
 <a
 href={url}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(e) => e.stopPropagation()}
 className={`inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md p-1 transition-colors ${className}`}
 title={`WhatsApp-এ মেসেজ পাঠান (${mobile})`}
 >
 <svg
 className="w-3.5 h-3.5 fill-current"
 viewBox="0 0 24 24"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path d="M17.472 14.382c-.301-.15-1.782-.879-2.057-.98-.276-.1-.477-.15-.678.15-.201.3-.778.98-.953 1.18-.176.2-.351.226-.653.075s-1.272-.469-2.423-1.496c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.527s-.678-1.633-.929-2.235c-.244-.587-.492-.507-.678-.517-.176-.01-.376-.01-.577-.01s-.527.075-.803.376c-.276.301-1.054 1.029-1.054 2.51s1.079 2.912 1.23 3.113c.15.201 2.122 3.24 5.14 4.544.718.31 1.278.496 1.716.635.723.23 1.381.197 1.901.12.579-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.076-.125-.276-.201-.577-.351zM12.04 2C6.524 2 2.05 6.474 2.05 11.99c0 1.991.583 3.847 1.591 5.419L2.01 22l4.757-1.571c1.517.934 3.3 1.472 5.273 1.472 5.516 0 9.99-4.474 9.99-9.99S17.556 2 12.04 2zm0 18.232c-1.776 0-3.421-.51-4.814-1.391l-.345-.22-2.822.932.943-2.75-.229-.364a8.17 8.17 0 0 1-1.254-4.449c0-4.526 3.684-8.21 8.21-8.21 4.526 0 8.21 3.684 8.21 8.21 0 4.526-3.684 8.21-8.21 8.21z" />
 </svg>
 {showText && <span className="text-[11px] font-medium font-mono">{mobile}</span>}
 </a>
 );
};
