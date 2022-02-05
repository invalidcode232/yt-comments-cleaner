// List of blacklisted words, feel free to add more
const BLACKLISTED_WORDS = [
    'subs',
    'challenge',
    'look',
    'profile',
    'sex',
    '18+',
    'subscribers',
]

// Check if comments section is loaded
let loaded_observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            if (mutation.addedNodes[i].id == 'sections') { // is loaded
                // Run our filter code
                on_comments_loaded(mutation.addedNodes[i]);
                break;
            }
        }
    });
});

loaded_observer.observe(document.body, {
    childList: true,
    subtree: true
});


// Filter code
function on_comments_loaded(comments_dom) {
    let comments_observer = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
            let mutation = mutations[i];

            for (let j = 0; j < mutation.addedNodes.length; j++) {
                let node = mutation.addedNodes[j];

                // Check if the node is a comment
                if (node.tagName == 'YTD-COMMENT-RENDERER') {
                    // Select profile picture, author, and comment text
                    let profile_picture = node.querySelector('#img.style-scope.yt-img-shadow');
                    let author = node.querySelector('#author-text.style-scope.ytd-comment-renderer');
                    let comment = node.querySelector('#content-text');
                    
                    if (!is_spam(comment.innerText)) {
                        // Cache the original comment
                        let original_comment = comment.innerText;
                        let viewed = false;
                        
                        // Hide the original comment and make it toggleable to reveal the original comment
                        comment.innerText = 'This comment was removed for being considered spam.';
                        comment.style.cursor = 'pointer';
                        comment.addEventListener('click', () => {
                            if (!viewed) {
                                comment.innerText = original_comment;
                                viewed = true;
                            }
                            else {
                                comment.innerText = 'This comment was removed for being considered spam.';
                                viewed = false;
                            }
                        });
                    }

                    if (!is_spam(author.innerText)) {
                        // Cache the original author
                        let original_author = author.innerText;
                        let viewed = false;

                        // Hide author name and profile picture
                        author.innerText = 'Anonymous';
                        profile_picture.style.display = 'none';

                        // Create a new button that will show the original author and reveal profile picture
                        let view_author = document.createElement('span');
                        view_author.style.cursor = 'pointer';
                        view_author.style.display = 'inline';
                        view_author.style.marginLeft = '5px';
                        view_author.style.color = '#ccc';
                        view_author.addEventListener('click', () => {
                            if (!viewed) {
                                author.innerText = original_author;
                                view_author.innerText = 'Hide author';
                                profile_picture.style.display = 'block';

                                viewed = true;
                            } else {
                                author.innerText = 'Anonymous';
                                view_author.innerText = 'View author';
                                profile_picture.style.display = 'none';

                                viewed = false;
                            }
                        });

                        view_author.innerText = 'View author';
                        author.parentNode.appendChild(view_author);
                    }
                }
            }
        }
    });


    comments_observer.observe(comments_dom, {
        childList: true,
        subtree: true
    });
}

// Filter logic
function is_spam(text) {
    // Check if the text contains anything other than the english alphabet, symbols, numbers, and spaces.
    let regex = /[^a-zA-Z0-9\s!?,;'.$():_|'"”“’-]/gu;
    if (text.match(regex)) {
        return false;
    }
    
    // Check if text is all caps lock and has a length of more than 10
    if (text.toUpperCase() == text && text.length > 10) {
        return false;
    }

    let blacklist_count = 0;

    let regex_k = /\b\d+k\b/gi;
    if (text.match(regex_k)) {
        blacklist_count += 1;
    }

    let blacklisted_words = text.split(' ').filter(word => BLACKLISTED_WORDS.includes(word.toLowerCase()));
    blacklist_count += blacklisted_words.length;

    if (blacklist_count >= 2) {
        return false;
    }

    return true;
}
