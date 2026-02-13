import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
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
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    padding: '4px',
                }}
            >
                <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#1d4ed8' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#020617' }} />
                </div>
                <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#94a3b8' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#94a3b8' }} />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
