import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { signUp } from '../../lib/authHelpers';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function SignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await signUp(data.email, data.password);
    if (!error) {
      router.push('/dashboard');
    } else {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-16 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <Input type="email" placeholder="Email" {...register('email')} />
      {errors.email && <div className="text-red-500 text-sm">{errors.email.message}</div>}
      <Input type="password" placeholder="Password" {...register('password')} />
      {errors.password && <div className="text-red-500 text-sm">{errors.password.message}</div>}
      <Button type="submit" disabled={isSubmitting}>
        Sign Up
      </Button>
    </form>
  );
}
