exports.handler = async (event) => {
  try {
    const data = event.body ? JSON.parse(event.body) : {};


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

Instructions:
- Natural, human tone
- Simple language
- Mention the city only once
- 60 to 90 words per review
- No emojis, hashtags, prices, or phone numbers
- No medical guarantees
- Write like a real person sharing experience
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
