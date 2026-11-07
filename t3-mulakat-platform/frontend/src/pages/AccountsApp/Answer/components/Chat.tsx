import React from 'react'

const Chat = ({ item }: { item: any }) => {
    return (
        <div >
            <div className="flex justify-start mt-2">
                <div style={{ backgroundColor: '#E31E24' }} className=" text-white p-3 rounded-lg max-w-xl">
                    {item?.question}
                </div>
            </div>

            <div className="flex justify-end mt-2">
                <div className="bg-gray-300 text-black p-3 rounded-lg max-w-xl">
                    {item?.answer}
                </div>
            </div>

            {item?.evaluateAnswer && (
                <div className="flex justify-start mt-2">
                    <div style={{ backgroundColor: '#6D72C3' }} className=" text-white p-3 rounded-lg max-w-xl">
                        {item?.evaluateAnswer}
                    </div>
                </div>
            )}

        </div>
    )
}

export default Chat