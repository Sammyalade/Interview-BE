function calculateAge(dateOfBirthString) {
  // Parse the dateOfBirth string (assuming the format is "DD/MM/YYYY")
  const [day, month, year] = dateOfBirthString.split("/");
  const dateOfBirth = new Date(year, month - 1, day);

  // Get the current date
  const currentDate = new Date();

  // Calculate the age
  let age = currentDate.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = currentDate.getMonth() - dateOfBirth.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && currentDate.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

exports.calculateAge = calculateAge;
