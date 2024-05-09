import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import FetchDataSteps from "@/components/tutorial/FetchDataSteps";
import Header from "@/components/Header";
import { redirect } from "next/navigation";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {revalidatePath} from "next/cache";
import {Input} from "@/components/ui/input";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const {data, error} = await supabase.from('todos').select('*');


  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          This is a protected page that you can only see as an authenticated
          user
        </div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <DeployButton />
            <AuthButton />
          </div>
        </nav>
      </div>


      <form action={async (formdata: FormData) => {
        'use server'
        const supabase = createClient();
        const {error} = await supabase.from('todos').insert({
          task: formdata.get('task') as string,
          user_id: user?.id
        });
        if(error) console.error(error.message);
        revalidatePath('/');
      }}>

        <div className={'flex m-4 gap-2 max-w-[50vw] mx-auto'}>
          <Input name={'task'} />
          <Button variant={'outline'} type={'submit'}>Add Todo</Button>
        </div>

        {!data || data.length == 0 ? 'No data found' : <div className={'flex flex-wrap gap-4 max-w-[75vw]'}>

          {data.map(todo => {
            return <Card>
              <CardHeader>
                <CardTitle>{todo.task}</CardTitle>
                <CardDescription>{(new Date(todo.inserted_at)).toDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled={todo.is_complete} formAction={async () => {
                  'use server'
                  const supabase = createClient();
                  const {error} = await supabase.from('todos').update({
                    is_complete: true
                  }).eq('id', todo.id);
                  if(error) console.error(error.message);
                  revalidatePath('/protected');
                }}>
                  {todo.is_complete ? 'Completed' : 'Mark as Completed'}
                </Button>
              </CardContent>
            </Card>
          })}

        </div>}
      </form>


    </div>
  );
}
