import lighthouse from '@lighthouse-web3/sdk'

function getAccessToken(): string {
    return process.env.WEB3_STORAGE_TOKEN || '';
}

async function uploadMetadata(metadata: Record<string, any>): Promise<IPFSResponse> {
    const response = await lighthouse.uploadText(
        JSON.stringify(metadata),
        getAccessToken(),
        metadata.id
    )
    return response.data;
}

async function getMetadataInfo(metadataHash: string): Promise<Record<string, any>> {
    const response = await lighthouse.getFileInfo(metadataHash);
    return response;
}

export { uploadMetadata, getMetadataInfo };