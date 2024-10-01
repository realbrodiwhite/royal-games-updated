export const handleFormSubmit = async (formData, action, successMsg, errorMsg) => {
  try {
    const { success, data } = await action(formData);
    if (success) {
      console.log(successMsg, data);
      alert(successMsg);
      return { success: true, data };
    } else {
      console.error(errorMsg, data);
      alert(errorMsg + ': ' + (data.error || data.errors.map(err => err.msg).join(', ')));
      return { success: false, data };
    }
  } catch (error) {
    console.error(errorMsg, error.message, error.stack);
    alert(errorMsg + ': ' + error.message);
    return { success: false, error };
  }
};