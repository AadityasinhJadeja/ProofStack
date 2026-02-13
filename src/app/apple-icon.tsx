import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse template
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: '4px solid rgba(0, 0, 0, 0.05)',
                    padding: '24px',
                }}
            >
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#1d4ed8' }} />
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#020617' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#94a3b8' }} />
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#94a3b8' }} />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
