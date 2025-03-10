const JUDGE0_API = 'http://34.131.67.45:2358';

export const Languages = {
  CPP: { 
    id: 54, 
    name: 'C++', 
    extension: 'cpp',
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code here
    return 0;
}`
  },
  PYTHON: { 
    id: 71, 
    name: 'Python', 
    extension: 'py',
    template: `def solve():
    # Your code here
    pass

if __name__ == "__main__":
    solve()`
  },
  JAVA: { 
    id: 62, 
    name: 'Java', 
    extension: 'java',
    template: `public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}`
  }
};

export async function submitCode(sourceCode, input, languageId) {
  try {
    const response = await fetch(`${JUDGE0_API}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: input,
      }),
    });

    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
}

export async function getSubmissionResult(token) {
  try {
    const response = await fetch(`${JUDGE0_API}/submissions/${token}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching result:', error);
    throw error;
  }
}
