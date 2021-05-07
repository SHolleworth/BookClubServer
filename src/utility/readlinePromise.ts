const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

interface RLPromise {
    question: (question: string) => Promise<string>
}

export default function (this: RLPromise) {

    this.question = (question: string): Promise<string> => {

        return new Promise((resolve, reject) => {

            rl.question(question, (input: string) => {

                return resolve(input)

            })

        });
        
    }

}