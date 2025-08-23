// const slugify = require('slugify');
// const User = require('../models/User');

// async function generateUniqueSlug(baseTitle, userId) {
//   // Generate the initial slug
//   let slug = slugify(baseTitle, { lower: true, strict: true });
//   let uniqueSlug = slug;
//   let counter = 1;

//   // Fetch the user
//   const user = await User.findById(userId);
//   if (!user) throw new Error('User not found');

//   // Extract all existing slugs from the user's media kits
//   const existingSlugs = user.mediaKit.map(kit => kit.customUrl);

//   // Loop to find a unique slug
//   while (existingSlugs.includes(uniqueSlug)) {
//     uniqueSlug = `${slug}-${counter}`;
//     counter++;
//   }

//   return uniqueSlug;
// }

// module.exports = generateUniqueSlug;


const slugify = require('slugify');
const User = require('../models/User');

async function generateUniqueSlug(baseTitle, userId) {
  let slug = slugify(baseTitle, { lower: true, strict: true });
  let uniqueSlug = slug;
  let counter = 1;

  const user = await User.findById(userId);
  console.log("slug")
  console.log(user)
  while (user.mediaKit.some(kit => kit.customUrl === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  console.log(uniqueSlug)
  return uniqueSlug;
}

module.exports = generateUniqueSlug;
