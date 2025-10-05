'use client';

import axiosInstance from 'src/utils/axios';
import { useEffect, useState } from 'react';
import SnapshotPreparingView from './snapshot-preparing';
import SnapshotCompletedView from './snapshot-completed';
import { useRouter } from 'next/navigation';

function CheckSnapshotStatus({ id }: { id: string }) {
    const [status, setStatus] = useState('processing');
    const [csvUrl, setCsvUrl] = useState('');
    
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            axiosInstance.post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/snapshot/${id}/status`)
                .then(response => {
                    const { status, csvUrl } = response.data;
                    if (status === 'completed' && csvUrl) {
                        clearInterval(interval);
                        setCsvUrl(csvUrl);
                        setStatus('completed');
                        // Redirect to the completed dashboard
                        router.push(`/dashboard/snapshot/completed/${id}?csvUrl=${encodeURIComponent(csvUrl)}`);
                    } else if (status === 'failed') {
                        clearInterval(interval);
                        setStatus('failed');
                        alert('Snapshot processing failed');
                    }
                })
                .catch(error => {
                    console.error('Failed to check snapshot status:', error);
                    alert('Error checking snapshot status');
                });
        }, 7500);

        return () => clearInterval(interval); // Clean up on unmount
    }, [id, router]);

    return (
        <div>
            {status === 'processing' && <SnapshotPreparingView />}
            {status === 'failed' && <p>Error processing your snapshot.</p>}
        </div>
    );
}

export default CheckSnapshotStatus;
