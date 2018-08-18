// Get all posts loaded on group view
export const getPosts = async page => {
  return await page.evaluate(() => {
    const posts = Array.from(document.querySelectorAll('a ._5ptz'));
    return posts.map(post => post.parentElement.href);
  });
};

// Send "End" button to scroll to the bottom to let facebook loads more posts
export const nextPage = async page => {
  await page.keyboard.press('End');
  return await page.waitFor(3e3);
};

// Get post meta (poster, caption, image, posted time)
export const getPostMeta = async (page, postURL) => {
  if (await page.url() !== postURL) {
    await page.goto(postURL, { timeout: 0 });
  }
  const postId = getPostIdFromURL(postURL);
  const caption = await page.evaluate(() => document.querySelector('.userContent').innerText);
  // const utime = await page.evaluate(() => document.querySelector('._5x46._1yz1 a abbr').dataset.utime);
  // const imageURL = await page.evaluate(() => document.querySelector('.mtm a').dataset.ploi || document.querySelector('.mtm img').src);
  // const reactions = await page.evaluate(() => document.querySelector('.UFILikeSentence').innerText.replace(/\s.*/, '').replace(/\n/g, ''));
  const meta = {
    id: postId,
    link: postURL,
    // actor: (await page.evaluate(() => {
      // const links = document.querySelectorAll('._5x46._1yz1 a');

      // return {
        // avatar: links[0].querySelector('img').src,
        // name: links[0].querySelector('img').attributes['aria-label'].value,
        // link: links[0].href
      // };
    // })),
    caption,
    // utime,
    // imageURL,
    // reactions,
    timestamp: Date.now()
  };

  return meta;
};

export const getPostIdFromURL = URL => URL.match(/permalink\/(.*)/)[1].toString().replace(/\//g, '').replace(/\n/g, '');

export const members = async page => {
  return await page.evaluate(() => {
    const members = Array.from(document.querySelectorAll('.fbProfileBrowserList ul div a'));
    return members.map(member => member.href);
  });
}
