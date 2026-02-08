exports.handler = async (event) => {
  try {
    const data = event.body ? JSON.parse(event.body) : {};

    // Word range control
    const lengthMap = {
      short: "40 to 60 words",
      medium: "60 to 90 words",
      long: "100 to 140 words"
    };

    const selectedLength = lengthMap[data.length] || "60 to 90 words";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
Generate exactly 3 different Google reviews in English.

Doctor: Dr. ${data.doctor}
City: ${data.city}
Treatment: ${data.treatment}
Star Rating: ${data.stars}

Length requirement:
Each review must be ${selectedLength}.

Instructions:
- Natural, human tone
- Simple language
- Mention the city only once
- No emojis, hashtags, prices, or phone numbers
- No medical guarantees
- Write like a real person sharing experience
- Do not repeat sentences across reviews
- Separate each review with two line breaks
`
                }
              ]
            }
          ]
        })
      }
    );

    const result = await response.json();

    if (!result.candidates) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Gemini API failed", details: result })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        review: result.candidates[0].content.parts[0].text
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        details: err.message
      })
    };
  }
};
