"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAIModal'
import { LoaderCircle } from 'lucide-react'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { useRouter } from 'next/navigation'

function AddNewInterview() {
    const [openDailog, setOpenDailog] = useState(false)
    const [jobPosition, setJobPosition] = useState()
    const [jobDesc, setJobDesc] = useState()
    const [jobExperience, setJobExperience] = useState()
    const [loading, setLoading] = useState(false)
    const [jsonResponse, setJsonResponse] = useState([])
    const router = useRouter()
    const { user } = useUser()

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const InputPrompt =
                `Job position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}.
                Depends on Job Position, Job Description & Years of Experience give us 5 Interview question along with Answer in JSON format.
                Give us question and answer field on JSON.`

            const result = await chatSession.sendMessage(InputPrompt)
            const rawText = await result.response.text()

            // Extract only JSON object/array from AI output
            const jsonMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
            if (!jsonMatch) {
                console.error("No valid JSON found in AI response")
                setLoading(false)
                return
            }

            const jsonString = jsonMatch[0]
            let parsedJson
            try {
                parsedJson = JSON.parse(jsonString)
            } catch (err) {
                console.error("Failed to parse JSON:", err)
                setLoading(false)
                return
            }

            console.log("Parsed JSON:", parsedJson)
            setJsonResponse(parsedJson)

            // Save to DB
            const resp = await db.insert(MockInterview)
                .values({
                    mockId: uuidv4(),
                    jsonMockResp: jsonString,
                    jobPosition,
                    jobDesc,
                    jobExperience,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-yyyy')
                })
                .returning({ mockId: MockInterview.mockId })

            console.log("Inserted ID:", resp)
            if (resp && resp[0]?.mockId) {
                setOpenDailog(false)
                router.push('/dashboard/interview/' + resp[0].mockId)
            }

        } catch (error) {
            console.error("Error in onSubmit:", error)
        }

        setLoading(false)
    }

    return (
        <div>
            <div
                className='p-10 border rounded-lg bg-secondary
                hover:scale-105 hover:shadow-md cursor-pointer
                transition-all border-dashed'
                onClick={() => setOpenDailog(true)}
            >
                <h2 className='text-lg text-center'>+ Add New</h2>
            </div>

            <Dialog open={openDailog} onOpenChange={setOpenDailog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Tell us more about your job interviewing
                        </DialogTitle>
                        <DialogDescription>
                            Add details about your job position/role, job description, and years of experience.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Form moved outside DialogDescription */}
                    <form onSubmit={onSubmit}>
                        <div className='mt-7 my-3'>
                            <label>Job Role/Job Position</label>
                            <Input
                                placeholder="Ex. Full Stack Developer"
                                required
                                onChange={(event) => setJobPosition(event.target.value)}
                            />
                        </div>
                        <div className='my-3'>
                            <label>Job Description/ Tech Stack (In Short)</label>
                            <Textarea
                                placeholder="Ex. React, Angular, NodeJs, MySql etc"
                                required
                                onChange={(event) => setJobDesc(event.target.value)}
                            />
                        </div>
                        <div className='my-3'>
                            <label>Years of experience</label>
                            <Input
                                placeholder="Ex. 5"
                                type="number"
                                max="100"
                                required
                                onChange={(event) => setJobExperience(event.target.value)}
                            />
                        </div>

                        <div className='flex gap-5 justify-end mt-5'>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpenDailog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ?
                                    <>
                                        <LoaderCircle className='animate-spin' /> Generating from AI
                                    </>
                                    : 'Start Interview'
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview
