export const uploadFile = async (files, email, parentFolderId, token) => {
  if (files.length === 0) {
    return { success: false, error: 'No files selected for upload.' };
  }

  const batchSize = 100; // Pode ajustar o tamanho do batch conforme necessário
  const results = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('parentFolderId', parentFolderId);

    batch.forEach((file) => {
      formData.append('file', file);
    });

    try {
      const response = await fetch(`https://sharepoint-integration-with-hubspot.onrender.com/hubspot/upload?email=${email}&parentFolderId=${parentFolderId}`, {
        method: 'PUT',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Batch uploaded successfully');
        const resultData = await response.json();
        results.push(...resultData);
      } else if (response.status === 401) {
        console.error('Authentication failed, token may be expired');
        return { success: false, error: 'Authentication failed. Please log in again through the Microsoft authentication extension card.' };
      } else if (response.status === 500) {
        console.error('Bad Gateway, possible authentication issue');
        return { success: false, error: 'In alternative, you are not authenticated or your session has expired. Please log in again using the Microsoft authentication extension card.' };
      } else {
        console.error('Batch upload failed', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        return { success: false, error: 'Upload failed. Please check your email and ID.' };
      }
    } catch (error) {
      console.error('Error uploading batch:', error);
      if (error.message.includes('Failed to fetch')) {
        return { success: false, error: 'Authentication failed. Please log in again through the Microsoft authentication extension card.' };
      }
      return { success: false, error: 'Upload failed. Please check your email and ID.' };
    }
  }

  return { success: true, results };
};
