import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const rejectionSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be 500 characters or fewer'),
})

type RejectionForm = z.infer<typeof rejectionSchema>

interface RejectionReasonModalProps {
  open:        boolean
  stationName: string
  isPending:   boolean
  onClose:     () => void
  onSubmit:    (reason: string) => void
}

export function RejectionReasonModal({
  open,
  stationName,
  isPending,
  onClose,
  onSubmit,
}: RejectionReasonModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RejectionForm>({ resolver: zodResolver(rejectionSchema) })

  const reason = useWatch({ control, name: 'rejectionReason', defaultValue: '' })

  function submit(data: RejectionForm) {
    onSubmit(data.rejectionReason)
    reset()
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md sm:rounded-[20px]">
        <DialogHeader>
          <DialogTitle className="font-sg font-bold text-[#133c1d]">Reject Station</DialogTitle>
          <DialogDescription>
            Provide a clear reason for rejecting <strong>{stationName}</strong>.
            The submitter will receive this message by email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rejectionReason">
              Rejection reason
              <span className="ml-1 text-red-500">*</span>
            </Label>
            <Textarea
              id="rejectionReason"
              rows={5}
              placeholder="e.g. The provided address could not be verified on the map…"
              {...register('rejectionReason')}
            />
            <div className="flex justify-between text-xs">
              {errors.rejectionReason ? (
                <span className="text-red-600">{errors.rejectionReason.message}</span>
              ) : (
                <span />
              )}
              <span className="text-gray-400">{reason.length}/500</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Rejecting…' : 'Reject Station'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
