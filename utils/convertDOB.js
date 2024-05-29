function calculateAge(dateOfBirthString) {
  // Parse the dateOfBirth string
  const dateOfBirth = new Date(dateOfBirthString);

  // Get the current date
  const currentDate = new Date();

  // Calculate the age
  let age = currentDate.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = currentDate.getMonth() - dateOfBirth.getMonth();
  const dayDifference = currentDate.getDate() - dateOfBirth.getDate();

  // Adjust age if the current date is before the birth date in the current year
  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age;
}

exports.calculateAge = calculateAge;
