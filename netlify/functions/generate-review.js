exports.handler = async (event) => {
  try {
    const data = event.body ? JSON.parse(event.body) : {};


    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
              text: `Generate 3 short Google reviews for Dr. ${data.doctor} in ${data.city} for ${data.treatment}. Separate each review with two line breaks.`
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
